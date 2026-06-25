from django.apps import AppConfig


class CirclesConfig(AppConfig):
    name = "circles"

    def ready(self):
        import circles.signals  # noqa: F401
