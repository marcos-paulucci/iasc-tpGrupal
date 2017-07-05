#!/bin/bash
seaport listen 9090 &
node load-balancer.js
