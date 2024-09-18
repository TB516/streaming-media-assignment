const fs = require('fs');
const path = require('path');

const getMedia = (request, response, fileName, mediaType) => {
  const file = path.resolve(`${__dirname}/../client/${fileName}`);

  fs.stat(file, (error, stats) => {
    if (error && error.code === 'ENOENT') {
      response.writeHead(404);
    } else if (error) {
      return response.end(error);
    }

    const { range } = request.headers.range ? request.headers : { range: 'bytes=0-' };

    const positions = range.replace(/bytes=/, '').split('-');

    let start = parseInt(positions[0], 10);

    const total = stats.size;
    const end = positions[1] ? parseInt(positions[1], 10) : total - 1;

    if (start > end) {
      start = end - 1;
    }

    const chunksize = (end - start) + 1;

    response.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': mediaType,
    });

    const stream = fs.createReadStream(file, { start, end });

    stream.on('open', () => {
      stream.pipe(response);
    });

    stream.on('error', (streamError) => {
      response.end(streamError);
    });

    return stream;
  });
};

const getParty = (request, response) => {
  getMedia(request, response, 'party.mp4', 'video/mp4');
};

const getBird = (request, response) => {
  getMedia(request, response, 'bird.mp4', 'video/mp4');
};

const getBling = (request, response) => {
  getMedia(request, response, 'bling.mp3', 'audio/mpeg');
};

module.exports = {
  getParty,
  getBird,
  getBling,
};
