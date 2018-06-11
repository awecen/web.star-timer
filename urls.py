from django.urls import path
from . import views
from . import apis
from rest_framework.urlpatterns import format_suffix_patterns

# from rest_framework import routers
# from .apis import AnswerViewSet

# set the application namespace
# https://docs.djangoproject.com/ja/2.0/intro/tutorial03/
app_name = 'question_typhoon'

urlpatterns = [
    # 書籍一覧表示のURL : (/)
    path('', views.MainView.as_view(), name='main'),
    path('logs/', views.LogsView.as_view(), name='main'),
    path('new_release/', views.NewReleaseView.as_view(), name='main'),

    # API
    # path('latest/', apis.SwitchLogDetail.as_view()),
    # path('list/', apis.SwitchLogList.as_view()),
    # path('today/', apis.SwitchLogToday.as_view()),
    # TimerRecordVersion
    path('latest/', apis.TimerRecordLatest.as_view()),
    path('list/', apis.TimerRecordList.as_view()),
    path('today/', apis.TimerRecordToday.as_view()),
    path('list/<int:pk>/', apis.TimerRecordDetail.as_view()),
    # path('answer/', apis.answer_list),
    # path('answer/<int:pk>/', apis.answer_detail),
    # path('answer/', apis.AnswerList.as_view()),
    # path('answer/<int:pk>/', apis.AnswerDetail.as_view()),
    # path('temporary_question_list/', apis.TemporaryQuestionListView.as_view()),
    # path('temporary_question_list/<int:temporary_question_list_id>/', apis.TemporaryQuestionListDetailView.as_view()),
    # path('users/', apis.UserList.as_view()),
    # path('users/<int:pk>/', apis.UserDetail.as_view()),
]

urlpatterns = format_suffix_patterns(urlpatterns)
