"""CLI entrypoint for running builders directly."""
from src.builders import build_all

if __name__ == "__main__":
    result = build_all(force=True)
    print(f"Build result: {result}")
