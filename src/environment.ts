export const API_URL = process.env.NODE_ENV === 'production' ?
'https://stormy-sierra-43816.herokuapp.com/' : 'http://localhost:4000/';

export const WSS_URL = process.env.NODE_ENV === 'production' ?
'wss://stormy-sierra-43816.herokuapp.com' : 'ws://localhost:4000';