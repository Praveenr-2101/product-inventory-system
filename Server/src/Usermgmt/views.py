from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from .serializers import RegisterSerializer, LoginSerializer

from src.constant.Logging import get_logger

logger = get_logger(__name__)



class RegisterView(APIView):
    
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():

            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            return Response({
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "email": user.email
            }, status=status.HTTP_200_OK)
            
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)


class UserProfileView(APIView):
    
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            logger.info(f"User profile requested by {user.username}")
            return Response({
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching user profile: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)