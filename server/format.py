import ast


def parser(raw_string):
    raw_string = raw_string.replace('```gherkin','').replace('```','')
    # return ast.literal_eval(raw_string)
    return raw_string
    