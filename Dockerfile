FROM python:slim

RUN apt-get update && \
        apt-get install -y pipx && \
        apt-get clean && \
        rm -rf /var/lib/apt/lists/*

ENV PATH="/root/.local/bin:$PATH"

RUN pipx ensurepath
RUN pipx install poetry

WORKDIR /app

COPY pyproject.toml .
RUN poetry install --no-root

COPY bin bin
COPY moviepicker moviepicker

# CMD ["poetry", "run", "flask", "--app", "moviepicker", "run", "--debug", "--host", "0.0.0.0", "--port", "6400"]
# CMD ["poetry", "run", "gunicorn", "--bind", "0.0.0:6400", "moviepicker:create_app()"]
ENTRYPOINT ["/app/bin/docker-entrypoint"]
CMD ["serve"]