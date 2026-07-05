from celery import Celery,Task
import celery_config



def celery_init_app(app):
    class FlaskTask(Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)
    
    celery_app = Celery(
        app.import_name, 
        task_class=FlaskTask,
        broker_url=celery_config.broker_url,
        result_backend=celery_config.result_backend,
    )
    celery_app.config_from_object(celery_config)
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app