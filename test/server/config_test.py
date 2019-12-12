import pytest

from os import path 
from server import config
from .helpers import MockFlaskApp


def test_config_loaded():
    for env in ['production', 'development']:
        mock_app = MockFlaskApp(env)
        assert mock_app.config.get('FOO') is None, 'Default values are not correct'
        assert mock_app.config.get('ENV_SPECIFIC_VALUE') is None, 'Default values are not correct'
        config.init_app(mock_app, path.join(path.dirname(__file__), 'config'))
        assert mock_app.config['FOO'] == 'bar', '%s configs were not loaded' % env
        assert mock_app.config['ENV_SPECIFIC_VALUE'] == env, '%s configs were not loaded' % env


def test_config_only_load_uppercase_keys():
    mock_app = MockFlaskApp('development')
    config.init_app(mock_app, path.join(path.dirname(__file__), 'config'))
    with pytest.raises(KeyError):
        mock_app.config['hello']


def test_config_file_missing():
    mock_app = MockFlaskApp('foobar')
    with pytest.raises(FileNotFoundError):
        config.init_app(mock_app, path.join(path.dirname(__file__), 'config'))


def test_config_key_missing():
    # our test file didn't override any environment specific configs
    mock_app = MockFlaskApp('test')
    with pytest.raises(KeyError):
        config.init_app(mock_app, path.join(path.dirname(__file__), 'config'))
