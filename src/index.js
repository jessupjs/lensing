import Lensing from './lensing';

const construct = (_osd, _viewer, _viewer_config) => {
    return new Lensing(_osd, _viewer, _viewer_config);
}

export  {construct}