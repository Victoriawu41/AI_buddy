from models import db, User

class UserDAO:
    @staticmethod
    def get_user_by_id(user_id):
        """Fetch user by ID."""
        return User.query.get(user_id)

    @staticmethod
    def get_user_by_username(username):
        """Fetch user by username."""
        return User.query.filter_by(username=username).first()

    @staticmethod
    def get_user_by_email(email):
        """Fetch user by email."""
        return User.query.filter_by(email=email).first()

    @staticmethod
    def create_user(username, email, password):
        """Create a new user and store it in the database."""
        
        user = User(username=username, email=email)
        user.set_password(password)  # Hash password
        db.session.add(user)
        db.session.commit()
        return user  # Return the newly created user

    @staticmethod
    def delete_user(user_id):
        """Delete user by ID."""
        user = UserDAO.get_user_by_id(user_id)
        if user:
            db.session.delete(user)
            db.session.commit()
            return True
        return False

    @staticmethod
    def update_user_email(user_id, new_email):
        """Update a user's email."""
        user = UserDAO.get_user_by_id(user_id)
        if user:
            user.email = new_email
            db.session.commit()
            return user
        return None