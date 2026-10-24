"""
Competitive point allocation engine for The Data Vault.
Whoever solves first gets the most points, descending by rank.
"""

def calculate_points_for_rank(rank_order: int) -> int:
    """
    Returns points awarded based on the player's solving rank for that specific milestone:
    - 1st to solve: 100 points
    - 2nd to solve: 80 points
    - 3rd to solve: 65 points
    - 4th+ (all subsequent solvers): 50 points
    """
    if rank_order == 1:
        return 100
    elif rank_order == 2:
        return 80
    elif rank_order == 3:
        return 65
    else:
        return 50
