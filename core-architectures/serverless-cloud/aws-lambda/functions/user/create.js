/**
 * Create User Lambda Function
 */

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

const USERS_TABLE = process.env.DYNAMODB_TABLE;

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { name, email, password } = body;
    
    // Validation
    if (!name || !email || !password) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required fields: name, email, password' })
      };
    }
    
    // Create user
    const userId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const user = {
      userId,
      name,
      email,
      password, // In production, hash the password!
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    await docClient.put({
      TableName: USERS_TABLE,
      Item: user
    }).promise();
    
    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        message: 'User created successfully',
        user: { ...user, password: undefined }
      })
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
