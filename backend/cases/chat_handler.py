# Case Chat AI response generation pipeline with semantic retrieval and structured citations.
import json
import logging
from typing import Tuple, List, Dict, Any, Optional
import boto3
from botocore.exceptions import BotoCoreError, ClientError
from sqlalchemy.orm import Session

from backend.config.settings import settings
from backend.db.models import ThreadMessageModel
from backend.db.repository import db_add_thread_message, db_get_thread_messages
from backend.ingestion.embedder import BedrockEmbedder
from backend.retrieval.case_search import search_case_chunks

logger = logging.getLogger("clauseguard.cases.chat")


def _generate_llm_reply(prompt: str) -> str:
    """Invokes AWS Bedrock LLM or generates deterministic fallback."""
    try:
        client = boto3.client(
            service_name="bedrock-runtime",
            region_name=settings.AWS_DEFAULT_REGION
        )
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": settings.LLM_MAX_TOKENS,
            "temperature": settings.LLM_TEMPERATURE,
            "messages": [{"role": "user", "content": prompt}]
        })
        response = client.invoke_model(
            body=body,
            modelId=settings.BEDROCK_LLM_MODEL_ID,
            accept="application/json",
            contentType="application/json"
        )
        resp_json = json.loads(response.get("body").read())
        return resp_json["content"][0]["text"].strip()
    except (ClientError, BotoCoreError, Exception) as exc:
        logger.info(f"Bedrock LLM unavailable or offline ({exc}). Using structured assistant response.")
        return ""


def handle_user_message(
    db: Session,
    case_id: str,
    thread_id: str,
    user_content: str,
    user_name: str = "User",
    embedder: Optional[BedrockEmbedder] = None
) -> Tuple[ThreadMessageModel, ThreadMessageModel]:
    """
    Processes user query in a case chat thread:
    1. Persists user message
    2. Embeds query & searches case chunks
    3. Fetches thread history
    4. Synthesizes AI response citing source materials
    5. Persists and returns assistant message with citations
    """
    # 1. Save user message
    user_msg = db_add_thread_message(
        db=db,
        thread_id=thread_id,
        case_id=case_id,
        role="user",
        content=user_content,
        agent_name=user_name
    )

    # 2. Semantic search for relevant case context
    if embedder is None:
        embedder = BedrockEmbedder()

    query_emb = embedder.embed_text(user_content)
    retrieved_chunks = search_case_chunks(
        db=db,
        case_id=case_id,
        query_embedding=query_emb,
        top_k=5
    )

    # 3. Retrieve thread history (excluding the message just added)
    history_msgs = db_get_thread_messages(db=db, thread_id=thread_id)
    history_text = "\n".join([
        f"{m.role.capitalize()} ({m.agent_name}): {m.content}"
        for m in history_msgs[-10:-1]
    ])

    # 4. Construct context and citations
    context_blocks = []
    citations_data = []
    for c in retrieved_chunks:
        pg_str = f"Page {c['page_number']}" if c.get("page_number") else "N/A"
        heading_str = f" [{c['heading_title']}]" if c.get("heading_title") else ""
        context_blocks.append(
            f"--- Source: {c['filename']} ({pg_str}){heading_str} ---\n{c['text']}"
        )
        citations_data.append({
            "document_id": c["document_id"],
            "filename": c["filename"],
            "page_number": c.get("page_number"),
            "chunk_id": c["chunk_id"],
            "text_excerpt": c["text"][:180].strip() + ("..." if len(c["text"]) > 180 else "")
        })

    context_str = "\n\n".join(context_blocks) if context_blocks else "No relevant case documents found."

    prompt = f"""You are a Case Intelligence Legal Assistant analyzing legal case documents.
Your job is to answer the lawyer's question accurately and objectively based solely on the provided case documents.

CASE DOCUMENTS CONTEXT:
{context_str}

RECENT CONVERSATION HISTORY:
{history_text or 'None'}

LAWYER'S QUESTION:
{user_content}

INSTRUCTIONS:
1. Provide a direct, professional, and well-structured answer.
2. Explicitly cite your sources using document names and sections when referencing facts.
3. If the context does not contain sufficient facts to answer, clearly state what information is missing.
"""

    # 5. Generate reply
    llm_reply = _generate_llm_reply(prompt)
    if not llm_reply:
        # Informative structured reply when offline
        if retrieved_chunks:
            top_sources = ", ".join(list(dict.fromkeys([c['filename'] for c in retrieved_chunks])))
            llm_reply = (
                f"Based on case documents ({top_sources}), the following relevant excerpt was found:\n\n"
                f"> \"{retrieved_chunks[0]['text'][:300]}...\"\n\n"
                f"Please refer to the attached citations for exact document locations."
            )
        else:
            llm_reply = (
                "No relevant passages were found in the uploaded case documents for this query. "
                "Please ensure relevant pleadings, evidence, or contracts have been uploaded to the case."
            )

    # 6. Save assistant message with structured citations
    assistant_msg = db_add_thread_message(
        db=db,
        thread_id=thread_id,
        case_id=case_id,
        role="assistant",
        content=llm_reply,
        agent_name="Case Assistant",
        citations=citations_data
    )

    return user_msg, assistant_msg
