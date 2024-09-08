from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/api/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hello, World!"})

@app.route('/api/echo', methods=['POST'])
def echo():
    data = request.json
    return jsonify(data)

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    # Simulated user data
    user = {"id": user_id, "name": f"User {user_id}", "email": f"user{user_id}@example.com"}
    return jsonify(user)

if __name__ == '__main__':
    app.run(debug=True)