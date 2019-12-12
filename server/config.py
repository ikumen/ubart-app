import os
import logging
import yaml

from os.path import dirname

log = logging.getLogger(__name__)


def init_app(app, config_dir=None):
    """
    Configures the given app with environment specific configuration.
    The environment is determined by Flask 'ENV' config value.
    """
    env = app.config['ENV']
    if not config_dir:
        config_dir = os.path.join(dirname(dirname(__file__)), 'config')
    config = _load_configs(env, config_dir)    
    _resolve_missing_configs([], config)

    for k,v in config.items():
        if k.isupper():
            app.config[k] = v


def _load_configs(env, config_dir):
    # Where all application config keys are defined, possibly missing value
    default_config = _load_config_file('default', config_dir)
    # Environment specific config values, that will override defaults
    env_config = _load_config_file(env, config_dir)
    # Optional local/one-off values that override everything
    local_config = _load_config_file('local', config_dir, silent=True)
    
    # First we merge required default configs with any environment specific
    config = _merge_dicts(default_config, env_config)
    # Finally merge with optional local config, make sure local.yaml is in .gitignore
    return _merge_dicts(config, local_config)


def _merge_dicts(to_dict, from_dict):
    if from_dict is not None:
        for k,v in from_dict.items():
            if k in to_dict and isinstance(to_dict[k], dict):
                _merge_dicts(to_dict[k], v)
            else:
                to_dict[k] = v
    return to_dict


def _load_config_file(name, config_dir, silent=False):
    try:
        config_file = os.path.join(config_dir, '%s.yml' % name)
        with open(config_file) as f:
            return yaml.load(f, Loader=yaml.FullLoader)
    except(IOError, FileNotFoundError, yaml.YAMLError) as e:
        msg = 'Unable to load required file: %s' % config_file
        if silent:
            log.warning(msg)
            return None
        raise
        

def _resolve_missing_configs(path, configs):
    if isinstance(configs, dict):
        for k,v in configs.items():
            if k.isupper():
                path.extend(['_', k])
                if v is None:
                    missing_k = ''.join(path[1:])
                    resolved_v = os.environ.get(missing_k)
                    if resolved_v is None:
                        raise KeyError('Missing environment variable: %s' % missing_k)
                    configs[k] = resolved_v
                elif hasattr(v, '__iter__'):
                    _resolve_missing_configs(path, v)
                path.pop()
    elif isinstance(configs, list):
        for config in configs:
            _resolve_missing_configs(path, config)
