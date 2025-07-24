from pydantic import BaseModel

class Cube(BaseModel):
    # Each face is a list of 9 colors
    # The colors are represented as strings
    # The list is a 3x3 matrix
    # The colors are represented as strings
    # The colors are represented as strings
    front: list[list[str]] = []
    back: list[list[str]] = []
    left: list[list[str]] = []
    right: list[list[str]] = []
    top: list[list[str]] = []
    bottom: list[list[str]] = []

class Response(BaseModel):
    # Expected response to be sent to the client
    # message lets any specific error be sent to the client
    # success is a boolean that indicates if the request was successful
    # cube is the cube that was sent to the client
    cube: Cube = Cube()
    success: bool = False
    message: str = ""

class Solution(BaseModel):
    # Solution is a class that contains the algorithm and the steps of an algorithm
    # algorithm is the name of the algorithm
    # steps is a list of steps that are to be executed in order
    # each step is a string that is a valid python function call
    # the function call should be in the format of a function call to the cube class
    algorithm: str = ""
    steps: list[str] = []
    message: str = ""
    success: bool = False

