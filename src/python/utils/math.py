import numpy as np

def norm(x: np.ndarray):
    return np.linalg.norm(x)


def unit_vector(x: np.ndarray) -> np.ndarray:
    return x / np.linalg.norm(x, axis=0)


def angle_between_vectors_rad(a: np.ndarray, b: np.ndarray) -> float:
    return np.arccos(np.sum(unit_vector(a) * unit_vector(b), axis=0))


def angle_between_vectors_deg(a: np.ndarray, b: np.ndarray) -> float:
    return np.rad2deg(np.arccos(np.sum(unit_vector(a) * unit_vector(b), axis=0)))
