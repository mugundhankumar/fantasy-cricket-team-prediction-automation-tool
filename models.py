# utils/models.py

from sqlalchemy import Column, Integer, String
from utils.database import Base

class Team(Base):
    __tablename__ = "teams"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    captain = Column(String)
    vice_captain = Column(String)
