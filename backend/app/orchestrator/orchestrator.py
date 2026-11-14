from typing import Dict, Any
from sqlalchemy.orm import Session
from backend.app.orchestrator.agent_router import AgentRouter


class AgentOrchestrator:
    """
    Central Agent Orchestrator. Coordinates AgentRouter and manages cross-agent state.
    """

    def __init__(self, db: Session):
        self.db = db
        self.router = AgentRouter(db)

    async def execute(self, intent: str, payload: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """
        Executes an intent through the AgentRouter with unified error boundaries and validation.
        """
        return await self.router.route(intent=intent, payload=payload, user_id=user_id)

