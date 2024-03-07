import express from 'express';
import routes from './routes/index';

const app = express()
const PORT = process.env.PORT || 5000;

app.use('/', routes);

app.listen(PORT, () => {
    console.log(`API available on localhost port ${PORT}`);
});

export default app;
