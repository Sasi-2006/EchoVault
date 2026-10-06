from ollama import AsyncClient


EMBEDDING_MODEL = "nomic-embed-text"


async def generate_embedding(text: str) -> list[float]:
    """
    Generate a vector embedding for the given text
    using the local Ollama embedding model.
    """

    client = AsyncClient()

    response = await client.embed(
        model=EMBEDDING_MODEL,
        input=text,
    )

    return response["embeddings"][0]