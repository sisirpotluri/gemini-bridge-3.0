from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import requests
import json

from model import model

with open('EECS280/structure.json') as f:
    data = json.load(f)


app = Flask(__name__)
CORS(app)


@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route('/get_current_course/', methods=['GET'])
def get_current_course():
    res = {
        'course': data['course'],
        'chapter' : 3,
        'title': data['title'],
        'introduction': data['introduction'],
        'submodule': 1
    }
    return res


@app.route('/get_feedback/', methods=['POST'])
def get_feedback():
    answer = request.get_json()
    print(answer)
    response = model.get_next_question(answer["answer"])
    return jsonify({"data" : response})


@app.route('/get_next_question/', methods=['POST'])
def get_next_question():
    json = request.get_json()
    print(json)
    response = model.get_next_question(json["answer"], json["question"])
    return jsonify({"data" : response})


@app.route('/structure/', methods=['GET'])
def get_structure():
    return jsonify(data)


@app.route('/response/', methods=['POST'])
def get_response():
    data = request.get_json()
    print("Received data:", data)  # Optionally print the data for debugging

    prompt = "THIS IS A CHAT MESSAGE. IGNORE THE QUESTION/ANSWER FORMAT AND THE DIRECTED GRAPH LOGIC FOR THIS\n"
    prompt += data["message"]
    response = model.get_response(prompt)
    return jsonify({"response" : response})


@app.route('/response_stream/', methods=['POST'])
def get_response_stream():
    data = request.get_json()
    print("Received data:", data)  # Optionally print the data for debugging

    generator = model.get_response_stream(data["message"])
    
    return Response(generator, mimetype='text/plain')

if __name__ == '__main__':
    app.run(debug=False, port=5111)