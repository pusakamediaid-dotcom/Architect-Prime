'use strict';

const AWS = require('aws-sdk');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();

class LambdaHandler {
  constructor() {
    this.tableName = process.env.USERS_TABLE || 'architect-prime-users';
  }

  async handle(event) {
    try {
      const { httpMethod, path, body, headers } = event;
      const userId = event.pathParameters?.userId;

      console.log('Lambda Event:', { httpMethod, path, userId });

      switch (httpMethod) {
        case 'POST':
          return await this.createUser(JSON.parse(body));
        case 'GET':
          return userId ? await this.getUser(userId) : await this.listUsers(event);
        case 'PUT':
          return await this.updateUser(userId, JSON.parse(body));
        case 'DELETE':
          return await this.deleteUser(userId);
        default:
          return this.response(400, { error: 'Method not allowed' });
      }
    } catch (error) {
      console.error('Lambda Error:', error);
      return this.response(500, { error: error.message });
    }
  }

  async createUser(data) {
    const { name, email, password } = data;
    
    if (!name || !email || !password) {
      return this.response(400, { error: 'Missing required fields' });
    }

    const timestamp = new Date().toISOString();
    const userId = require('uuid').v4();
    const passwordHash = await this.hashPassword(password);

    const user = {
      id: userId,
      name,
      email: email.toLowerCase(),
      passwordHash,
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await dynamodb.put({
      TableName: this.tableName,
      Item: user,
      ConditionExpression: 'attribute_not_exists(email)'
    }).promise();

    await this.publishEvent('user.created', user);

    return this.response(201, { id: userId, email, name, status: 'active' });
  }

  async getUser(userId) {
    const result = await dynamodb.get({
      TableName: this.tableName,
      Key: { id: userId }
    }).promise();

    if (!result.Item) {
      return this.response(404, { error: 'User not found' });
    }

    const { passwordHash, ...safeUser } = result.Item;
    return this.response(200, safeUser);
  }

  async listUsers(event) {
    const { limit = 20, lastKey } = event.queryStringParameters || {};
    
    let params = {
      TableName: this.tableName,
      Limit: parseInt(limit)
    };

    if (lastKey) {
      params.ExclusiveStartKey = JSON.parse(Buffer.from(lastKey, 'base64').toString());
    }

    const result = await dynamodb.scan(params).promise();
    
    const safeUsers = result.Items.map(({ passwordHash, ...user }) => user);
    
    return this.response(200, {
      users: safeUsers,
      count: safeUsers.length,
      lastKey: result.LastEvaluatedKey ? 
        Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64') : null
    });
  }

  async updateUser(userId, data) {
    const timestamp = new Date().toISOString();
    const updateExpression = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    const allowedFields = ['name', 'phone', 'address', 'avatar'];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateExpression.push(`#${field} = :${field}`);
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = data[field];
      }
    }

    if (updateExpression.length === 0) {
      return this.response(400, { error: 'No valid fields to update' });
    }

    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = timestamp;

    const result = await dynamodb.update({
      TableName: this.tableName,
      Key: { id: userId },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    }).promise();

    const { passwordHash, ...safeUser } = result.Attributes;
    return this.response(200, safeUser);
  }

  async deleteUser(userId) {
    await dynamodb.delete({
      TableName: this.tableName,
      Key: { id: userId }
    }).promise();

    return this.response(200, { message: 'User deleted successfully' });
  }

  async hashPassword(password) {
    const crypto = require('crypto');
    return crypto.createHmac('sha256', process.env.HASH_SECRET || 'secret')
      .update(password)
      .digest('hex');
  }

  async publishEvent(eventType, data) {
    await lambda.invoke({
      FunctionName: process.env.EVENT_PUBLISHER_FUNCTION || 'architect-prime-event-publisher',
      InvocationType: 'Event',
      Payload: JSON.stringify({ eventType, data })
    }).promise();
  }

  response(statusCode, body) {
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(body)
    };
  }
}

const handler = new LambdaHandler();

module.exports.handler = async (event) => {
  return handler.handle(event);
};