from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
import agents
import format
from fastapi.responses import PlainTextResponse

app = FastAPI()


@app.get("/")
async def read_root():
    return {"message": "Hello, World!"}


class Step(BaseModel):
    order: int
    context: Optional[str] = None
    image: str
    yaml: Optional[str] = None

class Scenario(BaseModel):
    id: str
    name: str
    steps: List[Step]
    description: Optional[str] = None
    parentId: Optional[str] = None  # Puede no estar presente (como en el "parent-scenario")

class ProjectRequest(BaseModel):
    project: str
    description: Optional[str] = None
    scenarios: List[Scenario]


@app.post("/project", response_class=PlainTextResponse)
async def get_yaml(data: ProjectRequest):
    for i_sc, scenario in enumerate(data.scenarios):
        for i_st, step in enumerate(scenario.steps):
            yaml = await get_yaml(step)
            data.scenarios[i_sc].steps[i_st].yaml = yaml
    cases = await test_cases(data)
    return cases


@app.post("/ss-to-yaml")
async def get_yaml(data: Step):
    output = agents.get_yaml(data.context, data.image)
    # print(output)
    return output["text"]

@app.post("/yaml-to-tc")
async def test_cases(data: ProjectRequest):
    output = agents.get_test_cases(data.model_dump_json())
    print(output)
    return format.parser(output["text"])
    #return format.json(output["text"])

