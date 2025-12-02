import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from sqlmodel import SQLModel


FIREBASE_SERVICE_ACCOUNT_PATH = "firebase-service-account.json" 

# 1. Start Firebase Admin SDK'
def initialize_firebase():
    """Initializes the Firebase Admin SDK using the service account key."""
    try:
        # Check if already initialized to avoid re-initialization
        if not firebase_admin._apps:
            cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized successfully.")
    except Exception as e:
        # Prevent application from starting if Firebase initialization fails
        print(f"FATAL ERROR: Could not initialize Firebase Admin SDK. {e}")


# User model to hold user information
class User(SQLModel):
    uid: str
    email: str

# OAuth2 Scheme for token extraction
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


# 2. JWT Token Verification Dependency
async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> User:
    """
    FastAPI Dependency to validate Firebase JWT and retrieve user details.
    (NOTE: oauth2_scheme is not defined yet, we will fix this part in main.py.)
    """
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token missing.")

    try:
        # Firebase's token verification function
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        email = decoded_token.get('email', 'N/A')

        # Returning the verified user's UID
        return User(uid=uid, email=email)
    except auth.InvalidIdToken:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication error: {e}")