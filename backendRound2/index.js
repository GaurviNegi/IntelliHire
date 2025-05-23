import { Server } from "socket.io";

const port = process.env.PORT || 8000

const io = new Server(port, {
    cors: true,
});

//we need to track which email is in which room
const emailToSocketIdMap = new Map();

//reverse mapping for getting email addresses from socket id
const socketIdToEmailMap = new Map();
io.on('connection', (socket) => {
    console.log(`Socket connection established`, socket.id);
    socket.on('room:join', (data) => {
        const { email, room } = data;
        emailToSocketIdMap.set(email, socket.id);
        socketIdToEmailMap.set(socket.id, email);
        io.to(room).emit('user:joined', { email, id: socket.id }); //new users info/ sends event to existing user
        socket.join(room)//user joins
        io.to(socket.id).emit('room:join', data);//push user into room
    })

    socket.on('user:call', ({ to, offer }) => {
        io.to(to).emit('incomming:call', { from: socket.id, offer });
    })

    socket.on('call:accepted', ({ to, ans }) => {
        io.to(to).emit('call:accepted', { from: socket.id, ans });

    })

    socket.on('peer:nego:needed', ({ to, offer }) => {
        console.log('peer:nego:needed', offer)
        io.to(to).emit('peer:nego:needed', { from: socket.id, offer })
    })

    socket.on('peer:nego:done', ({ to, ans }) => {
        console.log('peer:nego:done', ans)
        io.to(to).emit('peer:nego:final', { from: socket.id, ans })

    })
});

