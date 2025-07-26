from django.urls import path
from .views import RegisterView, LoginView,UserProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('auth/me/', UserProfileView.as_view(), name='user_profile'),
]