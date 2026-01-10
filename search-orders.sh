#!/bin/bash

# Quick search script for orders

if [ -z "$1" ]; then
    echo "Usage: ./search-orders.sh ORDER_ID"
    echo "Example: ./search-orders.sh AMZ123456789"
    exit 1
fi

ORDER_ID="$1"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

python3 "$SCRIPT_DIR/order-manager.py" search "$ORDER_ID"
