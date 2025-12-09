import firebase_admin
from firebase_admin import credentials, auth
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from sqlmodel import SQLModel
import os
import json

# 1. Firebase Admin SDK Başlatma
def initialize_firebase():
    """Initializes Firebase from Environment Variable (Prod) or Local File (Dev)."""
    try:
        if not firebase_admin._apps:
            # Seçenek A: Ortam Değişkeni (Docker/Coolify için)
            firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS")
            
            if firebase_creds_json:
                # JSON stringini dictionary'ye çevir
                cred_dict = json.loads(firebase_creds_json)
                cred = credentials.Certificate(cred_dict)
                firebase_admin.initialize_app(cred)
                print("Firebase Admin SDK initialized via Environment Variable.")
            
            # Seçenek B: Yerel Dosya (Local Dev için)
            else:
                local_file = "firebase-service-account.json"
                if os.path.exists(local_file):
                    cred = credentials.Certificate(local_file)
                    firebase_admin.initialize_app(cred)
                    print("Firebase Admin SDK initialized via Local File.")
                else:
                    print("WARNING: No Firebase credentials found!")

    except Exception as e:
        print(f"FATAL ERROR: Could not initialize Firebase. {e}")

# User model
class User(SQLModel):
    uid: str
    email: str

# OAuth2 Scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# 2. Dependency
async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> User:
    if not token:
        raise HTTPException(status_code=401, detail="Authentication token missing.")

    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token['uid']
        email = decoded_token.get('email', 'N/A')
        return User(uid=uid, email=email)
    except auth.InvalidIdToken:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication error: {e}")