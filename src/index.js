import Lensing from './lensing';

const create = (_osd, _viewer, _viewer_config, _lensing_config, _data_loads) => {
    return new Lensing(_osd, _viewer, _viewer_config, _lensing_config, _data_loads);
}

export {create}
