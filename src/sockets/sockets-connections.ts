// import jwt from 'jsonwebtoken';
// import _ from 'lodash';
// import { AuthModel } from '../auth/models/auth.schema';
// import { AuthPayload, IAuth } from '../auth/interface/auth.interface';
// import { redisClient } from '../redis/redis-post-cache';

// const socketAuth = require('socketio-auth');
// const cookie = require('cookie');

// export const socketIOSingleConnection = (io: SocketIO.Server) => {
//     io.on('connection', (socket: SocketIOClient.Socket) => {
//         socket.auth = false;
//         socket.on('authentication', async () => {
//             try {
//                 const parsedCookie = cookie.parse(socket.handshake.headers.cookie);
//                 const payload = jwt.verify(parsedCookie.social_chat_token, process.env.JWT_TOKEN!) as AuthPayload;
//                 const user: IAuth | string = await verifyUserExists(payload.username) as IAuth;

//                 const canConnect = await redisClient.setnx(`user:${user.id}`, socket.id);
//                 // console.log(canConnect);
//                 if (!canConnect) {
//                     socket.user = user;
//                     socket.auth = true;
//                     socket.emit('authenticated', {message: 'You are already logged in', title: 'Success', type: 'success'});
//                     return;
//                 }
//                 socket.user = user;
//                 return;
//             } catch (e) {
//                 socket.emit('unauthorized', {message: 'Unauthorized', title: 'Error', type: 'error'});
//                 return;
//             }
//         });

//         socket.on('disconnect', async (socket: SocketIOClient.Socket) => {
//             console.log(socket.user);
//             if (socket.user) {
//                 socket.auth = false;
//                 await redisClient.del(`user:${socket.user.id}`);
//                 socket.disconnect();
//             }
//         });
//     });
// }

// export const socketIOSingleUserConnections = (io: SocketIO.Server) => {
//     socketAuth(io, {
//         authenticate: async (socket: SocketIOClient.Socket, _data: any, callback: any) => {
//             try {
//                 const parsedCookie = cookie.parse(socket.handshake.headers.cookie);
//                 const payload = jwt.verify(parsedCookie.social_chat_token, process.env.JWT_TOKEN!) as AuthPayload;
//                 const user: IAuth | string = await verifyUserExists(payload.username) as IAuth;
//                 // const keyExists = await redisClient.exists(`user:${user.id}`);
//                 // if (!keyExists) {
//                 //     await redisClient.SETEX(`user:${user.id}`, 3600, socket.id);
//                 //     socket.user = user;
//                 //     return;
//                 // }

//                 const canConnect = await redisClient.setnx(`user:${user.id}`, socket.id);
//                 console.log(canConnect);
//                 if (!canConnect) {
//                     socket.user = user;
//                     return callback(null, {message: 'You are already logged in', title: 'Success', type: 'success'});
//                 }
//                 socket.user = user;
//                 return;
//             } catch (e) {
//                 return callback(null, {message: 'Unauthorized', title: 'Error', type: 'error'});
//             }
//         },
//         postAuthenticate: async (socket: SocketIOClient.Socket) => {
//             socket.conn.on('packet', async (packet: any) => {
//                 if (socket.auth && packet.type === 'ping') {
//                     await redisClient.set(`user:${socket.user.id}`, socket.id, 'XX');
//                 }
//             });
//         },
//         disconnect: async (socket: SocketIOClient.Socket) => {
//             if (socket.user) {
//               await redisClient.del(`user:${socket.user.id}`);
//             }
//         }
//       });
// };

// async function verifyUserExists(username: string): Promise<any> {
//     return new Promise((resolve, reject) => {
//         const user = AuthModel.findOne({ username }).exec();
//         if (!user) {
//           return reject('USER_NOT_FOUND');
//         }
//         return resolve(user);
//     });
// }

// /**
//  * If the socket attempted a connection before authentication, restore it.
//  */
// function restoreConnection(nsp: any, socket: SocketIOClient.Socket) {
//     if (_.find(nsp.sockets, {id: socket.id})) {
//       nsp.connected[socket.id] = socket;
//     }
// }