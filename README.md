# Influencer Engagement and Sponsorship Coordination Platform (IESCP)

## About the Project

The Influencer Engagement and Sponsorship Coordination Platform (IESCP) is a full-stack web application designed to streamline collaborations between sponsors and influencers. This platform provides a user-friendly interface and robust backend functionalities for creating and managing sponsorships, tasks, and user roles. It ensures smooth communication and real-time updates to enhance user experience.

Key features include:
- Role-based access for **Admins**, **Sponsors**, and **Influencers**.
- Real-time updates for dashboards using Vue.js.
- JWT-based authentication and authorization.
- Email notifications for critical updates using Mailhog.
- Background task processing with Celery and Redis.

## Technologies Used

- **Frontend**: Vue.js (via CDN), Bootstrap for responsive UI.
- **Backend**: Flask with Flask-JWT-Extended for authentication.
- **Database**: SQLite3 (configure as needed).
- **Task Queue**: Celery with Redis for background task handling.
- **Email**: Mailhog for testing email functionalities.
- **Other Tools**: Chart.js for visualizations.

---

## Installation and Setup

Follow the steps below to set up and run the application locally.

### Prerequisites

- Python 3.8+ installed
- Redis server installed and running
- Mailhog installed for testing email functionalities

---

### Setup Steps

1. **Clone the Repository**  
   ```
   git clone <repository-url>
   cd <repository-folder>
   ```
2. **Create a Virtual Environment**

  ```
  python -m venv virtual_environment_name
  ```
3. **Activate the Virtual Environment**

  On Windows:
  ```
  virtual_environment_name\Scripts\activate
  ```
  On macOS/Linux:
  ```
  source virtual_environment_name/bin/activate
  ```

4. **Install Dependencies**

  ```
  pip install -r requirements.txt
  ```

5. **Run the Application**
  Start the Flask app using:
  ```
  python main.py
  ```

6. **Start Redis Server:**
  ```
  sudo service redis-server start
  redis-server
  ```
7. **Start Celery Worker**
  ```
  celery -A main.celery worker -l info
  ```

8. **Start Celery Beat Scheduler**
  ```
  celery -A main.celery beat --max-interval 1 -l info
  ```

9. **Start Mailhog for Email Testing**
```
mailhog
```
  Access the Mailhog UI at: ```http://127.0.0.1:8025```
