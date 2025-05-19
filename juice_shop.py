import os
import json
from datetime import datetime

class JuiceShop:
    def __init__(self):
        self.users = self._load_user_data('users.txt')
        self.juices = self._load_data('juices.json')
    
    def _load_data(self, filename):
        """Load JSON data"""
        path = os.path.join('data', filename)
        try:
            with open(path, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    def _load_user_data(self, filename):
        """Load user data from TXT file"""
        path = os.path.join('data', filename)
        users = []
        try:
            with open(path, 'r') as f:
                for line in f:
                    if line.strip():
                        user_data = line.strip().split('|')
                        if len(user_data) >= 4:
                            users.append({
                                'username': user_data[0],
                                'password': user_data[1],
                                'email': user_data[2],
                                'registration_date': user_data[3],
                                'orders': eval(user_data[4]) if len(user_data) > 4 else []
                            })
        except FileNotFoundError:
            pass
        return users
    
    def _save_user_data(self, filename):
        """Save user data to TXT file"""
        path = os.path.join('data', filename)
        with open(path, 'w') as f:
            for user in self.users:
                orders_str = str(user.get('orders', []))
                line = f"{user['username']}|{user['password']}|{user['email']}|{user['registration_date']}|{orders_str}\n"
                f.write(line)
    
    def register_user(self, username, password, email):
        if any(user['username'] == username for user in self.users):
            return False
        
        self.users.append({
            'username': username,
            'password': password,
            'email': email,
            'registration_date': datetime.now().isoformat(),
            'orders': []
        })
        self._save_user_data('users.txt')
        return True
    
    def authenticate_user(self, username, password):
        return any(user['username'] == username and user['password'] == password 
                 for user in self.users)
    
    def get_juices(self):
        return self.juices
    
    def add_order(self, username, items):
        for user in self.users:
            if user['username'] == username:
                order = {
                    'date': datetime.now().isoformat(),
                    'items': items,
                    'total': sum(float(self.juices[item['id']]['price']) * item['quantity'] 
                              for item in items)
                }
                user['orders'].append(order)
                self._save_user_data('users.txt')
                return True
        return False