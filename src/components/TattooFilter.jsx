function TattooFilter({ categories, activeCategory, onCategoryChange }) {
  return (
    <div className="tattoo-filters">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={
            activeCategory === category
              ? "tattoo-filter active"
              : "tattoo-filter"
          }
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default TattooFilter;