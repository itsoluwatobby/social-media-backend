require('dotenv').config();
const express = require('express')
const app = express();
const helmet = require('helmet')
const mongoose = require('mongoose');
require('./config/configDB')();
const morgan = require('morgan')
const cors = require('cors');
const corsOptions = require('./config/corsOptions')
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload')

const PORT =process.env.PORT || 5000;

app.use(cors(corsOptions))
app.use(express.json())
app.use(helmet())
app.use(morgan('common'))
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(fileUpload())

app.use('/api/auth', require('./router/authRoute'))
app.use('/api/users', require('./router/userRoutes'))
app.use('/api/posts', require('./router/postsRoute'))
app.use('/api/conversation', require('./router/conversationRoute'))
app.use('/api/message', require('./router/messageRoute'))

app.get('/', (req, res) => res.send('running'))

mongoose.connection.once('open', () => {
   console.log('Database connected')
   app.listen(PORT, () => console.log('Server listening on Port-', PORT))
})