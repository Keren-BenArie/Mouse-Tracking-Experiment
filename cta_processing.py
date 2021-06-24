import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import xlsxwriter

# Create a workbook and add a worksheet.
workbook = xlsxwriter.Workbook('CTA Results.xlsx')
worksheet = workbook.add_worksheet("Flips All Users")

X_RIGHT = 624
X_LEFT = 102
X_MID = (X_RIGHT - X_LEFT) / 2
Y_MID = 344
RIGHT = (750, 575)
LEFT = (630, 575)

data = pd.read_csv("mouse_normal_behavior.csv")  # into data frame
RELEVANT_COL = ["x_cord", "y_cord", "time_cord", "OrderEx"]
PROFILIC_ID = ["ProlificID"]
x_right = 624
x_left = 102
x_mid = (x_right - x_left) / 2
y = 344


def take_relevant_data(data, cols):
    rel_data = data[cols].dropna()
    x_moves = pd.DataFrame(rel_data[cols[0]]).to_numpy()
    y_moves = pd.DataFrame(rel_data[cols[1]]).to_numpy()
    time_moves = pd.DataFrame(rel_data[cols[2]]).to_numpy()
    order_ex = pd.DataFrame(rel_data[cols[3]]).to_numpy()
    return x_moves, y_moves, time_moves, order_ex


def create_graphs():
    data_ideal_graph_x = np.arange(x_mid, x_right)
    data_ideal_graph_y = np.full((1, int(x_right - x_mid)), y)
    plt.scatter(data_ideal_graph_x, data_ideal_graph_y)
    plt.scatter()
    plt.show()


def flips_single_trial_count_mid_point(x_axes):
    mid_point = 0
    x_count = 0
    last_i = 0
    for i in range(1, len(x_axes)):
        cond_big = x_axes[last_i] > x_axes[mid_point]
        cond_small = x_axes[last_i] < x_axes[mid_point]
        if (not x_axes[i] > x_axes[mid_point]) and cond_big:
            x_count += 1
        if (not x_axes[last_i] < x_axes[mid_point]) and cond_small:
            x_count += 1
        last_i = i
    return x_count


def flips_single_trial_count(x_axes, y_axes):
    bigger, smaller = False, False
    x_count, y_count = 0, 0
    last_i = 0
    for i in range(1, len(x_axes)):
        if x_axes[last_i] >= x_axes[i]:
            if not bigger:
                bigger = True
                smaller = False
                x_count += 1
            else:
                continue
        if x_axes[last_i] < x_axes[i]:
            if not smaller:
                bigger = False
                smaller = True
                x_count += 1
            else:
                continue

    bigger, smaller = False, False
    last_i = 0
    for i in range(1, len(y_axes)):
        if y_axes[last_i] >= y_axes[i]:
            if not bigger:
                bigger = True
                smaller = False
                y_count += 1
            else:
                continue
        if y_axes[last_i] < y_axes[i]:
            if not smaller:
                bigger = False
                smaller = True
                y_count += 1
            else:
                continue

    return x_count, y_count


def flips_all_users(x_moves_all_trials_users, y_moves_all_trials_users):
    pass


def flips_per_user(x_moves_all_trials, y_moves_all_trials):
    profile = data[PROFILIC_ID].values[0][0]
    worksheet.write(0, 0, "Profilic ID")
    worksheet.write(0, 1, "Trial Number")
    worksheet.write(0, 2, "X Flips")
    worksheet.write(0, 3, "Y Flips")
    worksheet.write(0, 4, "X Flips From Middle Point")

    for i in range(2, len(x_moves)):  # i is the row number
        x_moves[i][0].strip("'")
        x_axis = x_moves[i][0].split(",")
        y_moves[i][0].strip("'")
        y_axis = y_moves[i][0].split(",")
        x_axis, y_axis = convert_to_integers(x_axis, y_axis)
        x_count, y_count = flips_single_trial_count(x_axis, y_axis)
        x_count_mid = flips_single_trial_count_mid_point(x_axis)
        worksheet.write(i, 0, profile)
        worksheet.write(i, 1, str(i))
        worksheet.write(i, 2, x_count)
        worksheet.write(i, 3, y_count)
        worksheet.write(i, 4, x_count_mid)
    workbook.close()


def convert_to_integers(x_axis, y_axis):
    x_axis_new, y_axis_new = np.zeros(len(x_axis)), np.zeros(len(y_axis))
    for i in range(len(x_axis)):
        x_axis_new[i] = (int(x_axis[i]))
    for i in range(len(y_axis)):
        y_axis_new[i] = (int(y_axis[i]))
    return x_axis_new, y_axis_new


def create_plot_APAP_AVAV(x_moves, y_moves, order_ex):
    global mean_x_approach, mean_y_approach, mean_y_avoid
    for i in range(2, len(x_moves)):  # one iteration = one trial
        x_moves[i][0].strip("'")
        x_axis = x_moves[i][0].split(",")
        y_moves[i][0].strip("'")
        y_axis = y_moves[i][0].split(",")
        x_axis, y_axis = convert_to_integers(x_axis, y_axis)
        x_axis = x_axis[x_axis != 0]
        y_axis = y_axis[y_axis != 0]

        print("number of x points inner: ", len(x_axis))
        print("number of y points inner : ", len(y_axis))

        mean_x_avoid, mean_y_avoid = np.zeros(len(x_axis)), np.zeros(len(y_axis))
        mean_x_approach, mean_y_approach = np.zeros(len(x_axis)), np.zeros(len(y_axis))
        if order_ex[i] == 'Avoid_First':
            for j in range(len(mean_x_avoid)):
                mean_x_avoid[j] += x_axis[j]
            for j in range(len(mean_y_avoid)):
                mean_y_avoid[j] += y_axis[j]
        else:
            for j in range(len(mean_x_approach)):
                mean_x_approach[j] += x_axis[j]
            for j in range(len(mean_y_approach)):
                mean_y_approach[j] += y_axis[j]

        fig = plt.figure(figsize=(5, 15))
        plt.plot(x_axis, y_axis, 'ro-', linewidth=1)
        plt.title('Mouse Movements of a Single Trial')
        plt.xlabel("Horizontal Mouse Position (x-Coordinate)")
        plt.ylabel("Vertical Mouse Position (y-Coordinate")
        plt.annotate("Right", RIGHT, color='blue')
        plt.annotate("Left", LEFT, color='blue')
        plt.show()

    means = [mean_x_approach, mean_y_approach, mean_x_avoid, mean_y_avoid]
    for i in range(len(means)):
        means[i] = means[i][means[i] != 0]
    for j in range(len(means)):
        for i, x in enumerate(means[j]):
            means[j][i] = x / len(means[j])

    fig_all = plt.figure()
    plt.plot(means[0], means[1], 'ro-', linewidth=1, color='red')
    plt.plot(means[2], means[3], 'ro-', linewidth=1, color='blue')
    plt.title('Mouse Movements All Trials of One User')
    plt.xlabel("Horizontal Mouse Position (x-Coordinate)")
    plt.ylabel("Vertical Mouse Position (y-Coordinate")
    # plt.annotate("Right", RIGHT, color='blue')
    # plt.annotate("Left", LEFT, color='blue')
    plt.show()


x_moves, y_moves, t_moves, order_ex = take_relevant_data(data, RELEVANT_COL)
create_plot_APAP_AVAV(x_moves, y_moves, order_ex)
# flips_per_user(x_moves,y_moves)
