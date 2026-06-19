import sys
import pathlib

_src = pathlib.Path(__file__).parent.parent / "src"
sys.path.insert(0, str(_src))
sys.path.insert(0, str(_src / "bronze"))
sys.path.insert(0, str(_src / "silver"))
sys.path.insert(0, str(_src / "gold"))
