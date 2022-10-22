const allowedOrigins = ['http://localhost:5173']

const corsOptions = {
   origin: (origin, callback) => {
      allowedOrigins.includes(origin) || !origin ? callback(null, true) : callback(new Error('Not allowed by CORS'))
   },
   credentials: true,
   optionsSuccessStatus: 200
}

module.exports = corsOptions
