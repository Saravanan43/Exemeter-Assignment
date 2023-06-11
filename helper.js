exports.calculateTimeTaken = (endTime) => {
  const executionTime = endTime[0] * 1000 + endTime[1] / 1000000; // Convert to milliseconds
  const executionTimeInSeconds = executionTime / 1000; // Convert to seconds
  const minutes = Math.floor(executionTimeInSeconds / 60);
  const seconds = Math.round(executionTimeInSeconds % 60);
  return `Time to process: ${minutes} minutes ${seconds} seconds\n`;
};

exports.calculateMemoryTaken = (startMemoryUsage, endMemoryUsage) => {
  const memoryUsed = endMemoryUsage - startMemoryUsage;
  const memoryUsedInMB = formatBytes(memoryUsed);
  return `Memory used: ${memoryUsedInMB}`;
};
function formatBytes(bytes) {
  const megabytes = bytes / (1024 * 1024);
  return `${Math.round(megabytes * 100) / 100} MB`;
}
