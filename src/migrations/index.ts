import * as migration_20260201_100343 from './20260201_100343';

export const migrations = [
  {
    up: migration_20260201_100343.up,
    down: migration_20260201_100343.down,
    name: '20260201_100343'
  },
];
