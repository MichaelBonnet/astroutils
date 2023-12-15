from .utils.constants import earth_radius_km, sun_radius_km
from .utils.math import norm, unit_vector, angle_between_vectors_rad

def check_object_umbra_penumba(earth_object_position_vector_eci: np.ndarray, earth_sun_position_vector_eci: np.ndarray) -> tuple[bool, bool]:
    # Uses Algorithm 34: SHADOW from pages 301 and 302 of Fundamentals of Astrodynamics and Applications (2013) by David Vallado
    # Assumes spherical Earth and Sun

    earth_sun_distance = norm(earth_sun_position_vector_eci)
    umbra_angle = np.arctan((sun_radius_km-earth_radius_km)/earth_sun_distance)
    penumbra_angle = np.arctan((sun_radius_km+earth_radius_km)/earth_sun_distance)

    in_umbra = False
    in_penumbra = False
    
    if np.dot(earth_object_position_vector_eci, earth_sun_position_vector_eci) < 0.0:
        angle = angle_between_vectors_rad(-earth_sun_position_vector_eci, earth_object_position_vector_eci)
        sathoriz = norm(earth_object_position_vector_eci)*np.cos(angle)
        satvert  = norm(earth_object_position_vector_eci)*np.sin(angle)
        x = earth_radius_km/np.sin(penumbra_angle)
        penvert = np.tan(penumbra_angle)*(x + sathoriz)
        if satvert <= penvert:
            in_penumbra = True
            y = earth_radius_km/np.sin(umbra_angle)
            umbvert = np.tan(umbra_angle)*(y-sathoriz)
            if satvert <= umbvert:
                in_umbra = True

    return in_penumbra, in_umbra

def check_eclipse(earth_object_position_vector_eci: np.ndarray, earth_sun_position_vector_eci: np.ndarray) -> bool:
    in_penumbra, in_umbra = check_object_umbra_penumba(earth_object_position_vector_eci, -earth_sun_position_vector_eci)
    if in_penumbra or in_umbra:
        return True
    return False
