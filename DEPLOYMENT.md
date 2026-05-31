# deployment notes

## github

push the code to a github repo (remember .env is gitignored so secrets don't go up, only .env.example)

## backend (render)

1. create a postgres db on render (free tier)
2. create a web service, point it at the backend/ folder
3. build command: `pip install -r requirements.txt`
4. start command: `gunicorn --bind 0.0.0.0:$PORT run:app`
5. set DATABASE_URL and SECRET_KEY in environment variables
6. add FRONTEND_URL after vercel deploy (for CORS)

## docker hub

build and push the backend image if needed for submission:
```
docker build -t yourusername/stockflow-backend:latest ./backend
docker push yourusername/stockflow-backend:latest
```

## frontend (vercel)

import repo, set root dir to `frontend`, add VITE_API_URL env var pointing at your render backend url

then go back to render and set FRONTEND_URL to the vercel url so CORS works
