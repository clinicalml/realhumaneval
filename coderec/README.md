
client side:


- task alocation: give them one that is not completed, if they were there before and not completed, give them old task, if they completed give them anything

- fix pasting

- pre registration https://aspredicted.org/

 preregi https://aspredicted.org/blind.php?x=Z3D_Z2B
https://aspredicted.org/blind.php?x=LMM_4K9


one compiler supported libraries:
https://onecompiler.com/python/3x9knsj24



How to add secret api key:

firebase functions:secrets:set STRIPE_SECRET_KEY


to deploy:

firebase deploy



to print output of matplotlib:
```python
import matplotlib.pyplot as plt
import base64
from io import BytesIO

# Sample data
x = [1, 2, 3, 4, 5]
y = [1, 4, 9, 16, 25]

# Create a figure and an axes
plt.figure()
plt.plot(x, y)  # Plot some data on the axes

# Add title and labels
plt.title("Simple Plot")
plt.xlabel("x")
plt.ylabel("y")

# Save the plot to a BytesIO object
img = BytesIO()
plt.savefig(img, format='png')
img.seek(0)

# Convert the BytesIO object to a Base64 string
plot_url = base64.b64encode(img.getvalue()).decode()
```
then:

<img src="data:image/png;base64,{{plot_url}}" />
