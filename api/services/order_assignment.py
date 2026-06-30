from api.models import MealBlock, Order


def assign_orders_to_meal_blocks(
    meal_blocks: list[MealBlock],
    orders: list[Order]
) -> None:
    """
    Assign every order to exactly one meal block.
    Modifies meal_blocks in place.
    """

    # Remove old assignments
    for block in meal_blocks:
        block.orders.clear()

    # Assign each order
    for order in orders:

        for block in meal_blocks:

            # Wrong day
            if block.day_key != order.order_day:
                continue

            # Order falls inside this meal window
            if block.start <= order.order_time_min < block.end:
                block.orders.append(order)
                break