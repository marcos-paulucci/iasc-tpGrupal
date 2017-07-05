module.exports = {
  "balancerPort": 8500,
  "serverTimeout": 10000,
  "servers" : [
    {
     "port": 8501,
     "retryConnection": 1
    },
    {
      "port": 8502,
        "retryConnection": 1
    },
    {
      "port": 8503,
        "retryConnection": 1
    }]
}