const { connect } = require('mongoose')

const io = require('socket.io')(8800, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
})

var activeUsers = []

io.on('connection', (socket) => {
    // add new user
    socket.on('new-user-add', (newUserId) => {
        if (!activeUsers.some((user) => user.id === newUserId)) {
            activeUsers.push({
                userId: newUserId,
                socketId: socket.id
            })
        }
        console.log('connected user:',activeUsers);
        
        io.emit('get-users', activeUsers)
    })
    // get message on one
    
    socket.on('send-message', (data) => {
        const { receiverId } = data
        const user = activeUsers.find((user) => user.userId === receiverId)
        if (user) {
            
            io.to(user.socketId).emit('receive-message',data)
        }
    })

      socket.on("join_room", (data) => {
        socket.join(data);
          console.log("user joined room:", data);
      });

      socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data);
      });

    socket.on('disconnect', () => {
        activeUsers = activeUsers.filter((user) => user.socketId !== socket.id)
        console.log("user disconnected:", activeUsers);
        io.emit('get-users', activeUsers)
        
    })
})
