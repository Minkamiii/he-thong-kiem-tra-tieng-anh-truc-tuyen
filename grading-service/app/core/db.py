from sqlmodel import SQLModel, Session, create_engine
from app.core.config import settings # Import settings

# Use the validated URL from settings
# We replace 'postgres://' with 'postgresql://' because SQLAlchemy 
# sometimes prefers the latter, though most drivers handle both.
connection_string = settings.DATABASE_URL.replace("postgres://", "postgresql://")

engine = create_engine(connection_string)

def get_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)