import ast


def json(raw_string):
    raw_string = raw_string.replace('```json','').replace('```','')
    return ast.literal_eval(raw_string)
    