import fileSystem from 'fs';

type FileSystem = typeof fileSystem;
interface IPromisifiedFs extends FileSystem {
  [x: string]: any;
}
