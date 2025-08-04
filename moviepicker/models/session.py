import uuid

from . import db
import uuid

class Session(db.Model):
    __tablename__ = 'session'

    session_id = db.Column(db.String(100), primary_key=True, default=lambda: str(uuid.uuid4()))
    display_id = db.Column(db.String(4), unique=True, nullable=False)
    match_threshold = db.Column(db.Float, default=1.0)
    total_user = db.Column(db.Integer)
    genres = db.Column(db.JSON, default=list)
    providers = db.Column(db.JSON, default=list)
    expiry_time = db.Column(db.DateTime, nullable=False)

    def __repr__(self):
        return f'<Session ID - {self.session_id}>'

class SessionMovie(db.Model):
    __tablename__ = 'sessionMovie'

    session_id = db.Column(db.String(100), db.ForeignKey('session.session_id'), primary_key=True)
    movie_id = db.Column(db.String(60), primary_key=True, nullable=False)
    match_count = db.Column(db.Integer, default=0)

class WebsocketSession(db.Model):
    __tablename__ = 'websocketsession'

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.String(100), db.ForeignKey('session.session_id'), nullable=False)
    socket_id = db.Column(db.String(100), nullable=False)

    def __repr__(self):
        return f'<WebSocket Session - {self.session_id}, Socket ID - {self.socket_id}>'